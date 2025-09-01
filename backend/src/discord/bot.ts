import { Client, GatewayIntentBits, Events, REST, Routes } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

import logger from '../utils/logger';
import { SubscriptionService } from '../services/subscription';
import { PaymentService } from '../services/payment';

/**
 * Multi-tenant Discord Bot for CommunityOS
 * Handles role management, payment verification, and community interactions
 */
export class DiscordBot {
  private client: Client;
  private prisma: PrismaClient;
  private redis: Redis;
  private subscriptionService: SubscriptionService;
  private paymentService: PaymentService;
  private activeCommunities: Map<string, any> = new Map();

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
    });

    this.prisma = new PrismaClient();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.subscriptionService = new SubscriptionService(this.prisma, this.redis);
    this.paymentService = new PaymentService(this.prisma, this.redis);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.once(Events.ClientReady, this.onReady.bind(this));
    this.client.on(Events.GuildMemberAdd, this.onMemberJoin.bind(this));
    this.client.on(Events.GuildMemberRemove, this.onMemberLeave.bind(this));
    this.client.on(Events.InteractionCreate, this.onInteraction.bind(this));
    this.client.on(Events.MessageCreate, this.onMessage.bind(this));
    this.client.on(Events.Error, this.onError.bind(this));
  }

  public async start(): Promise<void> {
    try {
      const token = process.env.DISCORD_BOT_TOKEN;
      if (!token) {
        throw new Error('DISCORD_BOT_TOKEN is required');
      }

      await this.client.login(token);
      logger.info('Discord bot started successfully');
    } catch (error) {
      logger.error('Failed to start Discord bot:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.client.destroy();
      await this.prisma.$disconnect();
      await this.redis.quit();
      logger.info('Discord bot stopped successfully');
    } catch (error) {
      logger.error('Error stopping Discord bot:', error);
    }
  }

  private async onReady(): Promise<void> {
    if (!this.client.user) return;

    logger.info(`Discord bot logged in as ${this.client.user.tag}`);
    logger.info(`Bot is active in ${this.client.guilds.cache.size} guilds`);

    // Load all community configurations
    await this.loadCommunityConfigs();

    // Register slash commands for all guilds
    await this.registerSlashCommands();

    // Set bot status
    this.client.user.setActivity('CommunityOS - Monetize Your Community', {
      type: 0, // Playing
    });

    // Start periodic tasks
    this.startPeriodicTasks();
  }

  private async loadCommunityConfigs(): Promise<void> {
    try {
      const communities = await this.prisma.community.findMany({
        include: {
          botConfig: true,
          subscriptionTiers: true,
        },
        where: {
          status: 'active',
        },
      });

      for (const community of communities) {
        if (community.botConfig?.isActive) {
          this.activeCommunities.set(community.discordGuildId, {
            ...community,
            guild: this.client.guilds.cache.get(community.discordGuildId),
          });
        }
      }

      logger.info(`Loaded ${this.activeCommunities.size} active community configs`);
    } catch (error) {
      logger.error('Error loading community configs:', error);
    }
  }

  private async onMemberJoin(member: any): Promise<void> {
    try {
      const guildId = member.guild.id;
      const community = this.activeCommunities.get(guildId);

      if (!community) return;

      // Check if user has an active subscription
      const subscription = await this.subscriptionService.getActiveSubscription(
        community.id,
        member.user.id
      );

      if (subscription) {
        // Assign premium roles
        await this.assignSubscriptionRoles(member, subscription);
      }

      // Send welcome message if configured
      if (community.botConfig?.welcomeMessage) {
        await this.sendWelcomeMessage(member, community.botConfig.welcomeMessage);
      }

      // Log the event
      await this.logAnalyticsEvent(community.id, 'member_joined', {
        userId: member.user.id,
        username: member.user.username,
        hasSubscription: !!subscription,
      });
    } catch (error) {
      logger.error('Error handling member join:', error);
    }
  }

  private async onMemberLeave(member: any): Promise<void> {
    try {
      const guildId = member.guild.id;
      const community = this.activeCommunities.get(guildId);

      if (!community) return;

      // Log the event
      await this.logAnalyticsEvent(community.id, 'member_left', {
        userId: member.user.id,
        username: member.user.username,
      });
    } catch (error) {
      logger.error('Error handling member leave:', error);
    }
  }

  private async onInteraction(interaction: any): Promise<void> {
    try {
      if (!interaction.isChatInputCommand()) return;

      const { commandName, guildId } = interaction;
      const community = this.activeCommunities.get(guildId);

      if (!community) {
        await interaction.reply({
          content: 'This server is not configured with CommunityOS.',
          ephemeral: true,
        });
        return;
      }

      switch (commandName) {
        case 'subscribe':
          await this.handleSubscribeCommand(interaction, community);
          break;
        case 'status':
          await this.handleStatusCommand(interaction, community);
          break;
        case 'cancel':
          await this.handleCancelCommand(interaction, community);
          break;
        case 'help':
          await this.handleHelpCommand(interaction, community);
          break;
        default:
          await interaction.reply({
            content: 'Unknown command.',
            ephemeral: true,
          });
      }
    } catch (error) {
      logger.error('Error handling interaction:', error);
      
      try {
        await interaction.reply({
          content: 'An error occurred while processing your request.',
          ephemeral: true,
        });
      } catch (replyError) {
        logger.error('Error sending error reply:', replyError);
      }
    }
  }

  private async handleSubscribeCommand(interaction: any, community: any): Promise<void> {
    const tiers = community.subscriptionTiers.filter((tier: any) => tier.isActive);

    if (tiers.length === 0) {
      await interaction.reply({
        content: 'No subscription tiers are available at this time.',
        ephemeral: true,
      });
      return;
    }

    // Create subscription selection embed
    const embed = {
      title: `${community.name} - Subscription Tiers`,
      description: 'Choose a subscription tier to get started:',
      color: 0x0099ff,
      fields: tiers.map((tier: any) => ({
        name: `${tier.name} - $${tier.price}/${tier.interval}`,
        value: tier.description || 'Premium access',
        inline: true,
      })),
      footer: {
        text: 'Use the buttons below to subscribe or visit our dashboard',
      },
    };

    // Create action buttons
    const buttons = tiers.slice(0, 3).map((tier: any) => ({
      type: 2,
      style: 1,
      label: `Subscribe to ${tier.name}`,
      custom_id: `subscribe_${tier.id}`,
    }));

    await interaction.reply({
      embeds: [embed],
      components: [
        {
          type: 1,
          components: buttons,
        },
      ],
      ephemeral: true,
    });
  }

  private async handleStatusCommand(interaction: any, community: any): Promise<void> {
    const subscription = await this.subscriptionService.getActiveSubscription(
      community.id,
      interaction.user.id
    );

    if (!subscription) {
      await interaction.reply({
        content: 'You do not have an active subscription.',
        ephemeral: true,
      });
      return;
    }

    const embed = {
      title: 'Your Subscription Status',
      color: 0x00ff00,
      fields: [
        {
          name: 'Tier',
          value: subscription.tier.name,
          inline: true,
        },
        {
          name: 'Status',
          value: subscription.status,
          inline: true,
        },
        {
          name: 'Next Billing Date',
          value: new Date(subscription.currentPeriodEnd).toLocaleDateString(),
          inline: true,
        },
      ],
    };

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }

  private async assignSubscriptionRoles(member: any, subscription: any): Promise<void> {
    try {
      const roleId = subscription.tier.discordRoleId;
      if (!roleId) return;

      const role = member.guild.roles.cache.get(roleId);
      if (!role) {
        logger.warn(`Role ${roleId} not found in guild ${member.guild.id}`);
        return;
      }

      await member.roles.add(role);
      logger.info(`Assigned role ${role.name} to ${member.user.username}`);
    } catch (error) {
      logger.error('Error assigning subscription roles:', error);
    }
  }

  private async sendWelcomeMessage(member: any, message: string): Promise<void> {
    try {
      const personalizedMessage = message
        .replace('{username}', member.user.username)
        .replace('{server}', member.guild.name);

      await member.send(personalizedMessage);
    } catch (error) {
      logger.error('Error sending welcome message:', error);
    }
  }

  private async registerSlashCommands(): Promise<void> {
    try {
      const commands = [
        {
          name: 'subscribe',
          description: 'View and subscribe to available membership tiers',
        },
        {
          name: 'status',
          description: 'Check your subscription status',
        },
        {
          name: 'cancel',
          description: 'Cancel your subscription',
        },
        {
          name: 'help',
          description: 'Get help with CommunityOS commands',
        },
      ];

      const rest = new REST({ version: '10' }).setToken(
        process.env.DISCORD_BOT_TOKEN!
      );

      // Register commands globally
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
        { body: commands }
      );

      logger.info('Successfully registered slash commands');
    } catch (error) {
      logger.error('Error registering slash commands:', error);
    }
  }

  private startPeriodicTasks(): void {
    // Check for expired subscriptions every 5 minutes
    setInterval(async () => {
      await this.checkExpiredSubscriptions();
    }, 5 * 60 * 1000);

    // Update community configs every hour
    setInterval(async () => {
      await this.loadCommunityConfigs();
    }, 60 * 60 * 1000);
  }

  private async checkExpiredSubscriptions(): Promise<void> {
    try {
      const expiredSubscriptions = await this.prisma.subscription.findMany({
        where: {
          status: 'active',
          currentPeriodEnd: {
            lt: new Date(),
          },
        },
        include: {
          member: true,
          community: true,
          tier: true,
        },
      });

      for (const subscription of expiredSubscriptions) {
        await this.handleExpiredSubscription(subscription);
      }
    } catch (error) {
      logger.error('Error checking expired subscriptions:', error);
    }
  }

  private async handleExpiredSubscription(subscription: any): Promise<void> {
    try {
      const guild = this.client.guilds.cache.get(
        subscription.community.discordGuildId
      );
      if (!guild) return;

      const member = await guild.members.fetch(subscription.member.discordUserId);
      if (!member) return;

      // Remove subscription roles
      if (subscription.tier.discordRoleId) {
        const role = guild.roles.cache.get(subscription.tier.discordRoleId);
        if (role) {
          await member.roles.remove(role);
        }
      }

      // Update subscription status
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'canceled' },
      });

      logger.info(`Handled expired subscription for ${member.user.username}`);
    } catch (error) {
      logger.error('Error handling expired subscription:', error);
    }
  }

  private async logAnalyticsEvent(
    communityId: string,
    eventName: string,
    properties: any
  ): Promise<void> {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          communityId,
          eventType: 'discord',
          eventName,
          properties,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error logging analytics event:', error);
    }
  }

  private async onMessage(message: any): Promise<void> {
    // Handle direct messages for customer support
    if (message.channel.type === 1 && !message.author.bot) {
      // This is a DM to the bot
      await this.handleDirectMessage(message);
    }
  }

  private async handleDirectMessage(message: any): Promise<void> {
    try {
      // Simple auto-reply for now
      await message.reply(
        'Hi! Thanks for reaching out. For support, please visit our help center at https://communityos.com/help or contact support@communityos.com'
      );
    } catch (error) {
      logger.error('Error handling direct message:', error);
    }
  }

  private onError(error: Error): void {
    logger.error('Discord client error:', error);
  }

  // Public methods for external API calls
  public async updateMemberRoles(
    guildId: string,
    userId: string,
    subscription: any
  ): Promise<void> {
    try {
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) return;

      const member = await guild.members.fetch(userId);
      if (!member) return;

      await this.assignSubscriptionRoles(member, subscription);
    } catch (error) {
      logger.error('Error updating member roles:', error);
    }
  }

  public async removeMemberRoles(
    guildId: string,
    userId: string,
    roleId: string
  ): Promise<void> {
    try {
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) return;

      const member = await guild.members.fetch(userId);
      if (!member) return;

      const role = guild.roles.cache.get(roleId);
      if (!role) return;

      await member.roles.remove(role);
    } catch (error) {
      logger.error('Error removing member roles:', error);
    }
  }
}