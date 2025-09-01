'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Bot,
  CreditCard,
  Settings,
  BarChart3
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { MemberGrowthChart } from '@/components/dashboard/member-growth-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { CommunityOverview } from '@/components/dashboard/community-overview';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { api } from '@/lib/api';

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalMembers: number;
  activeSubscriptions: number;
  revenueGrowth: number;
  memberGrowth: number;
  churnRate: number;
  averageRevenuePerUser: number;
}

interface Community {
  id: string;
  name: string;
  discordGuildId: string;
  memberCount: number;
  subscriptionTier: string;
  monthlyRevenue: number;
  status: string;
  avatarUrl?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get<DashboardStats>('/analytics/dashboard-stats'),
    enabled: !!session,
  });

  // Fetch user's communities
  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: () => api.get<Community[]>('/communities'),
    enabled: !!session,
  });

  if (status === 'loading' || statsLoading || communitiesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const dashboardStats = stats?.data || {
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalMembers: 0,
    activeSubscriptions: 0,
    revenueGrowth: 0,
    memberGrowth: 0,
    churnRate: 0,
    averageRevenuePerUser: 0,
  };

  const userCommunities = communities?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {session.user?.name}! Here's an overview of your communities.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${dashboardStats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${
                  dashboardStats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {dashboardStats.revenueGrowth >= 0 ? '+' : ''}
                  {dashboardStats.revenueGrowth.toFixed(1)}% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${dashboardStats.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Current month earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.totalMembers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${
                  dashboardStats.memberGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {dashboardStats.memberGrowth >= 0 ? '+' : ''}
                  {dashboardStats.memberGrowth.toFixed(1)}% growth
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.activeSubscriptions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.churnRate.toFixed(1)}% monthly churn
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Revenue Chart */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>
                    Monthly revenue over the past 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenueChart />
                </CardContent>
              </Card>

              {/* Member Growth Chart */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Member Growth</CardTitle>
                  <CardDescription>
                    Total members across all communities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MemberGrowthChart />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Recent Transactions */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Latest payments and subscriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTransactions />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuickActions />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Average Revenue Per User</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${dashboardStats.averageRevenuePerUser.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Monthly ARPU across all communities
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {dashboardStats.churnRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Monthly subscription cancellation rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {dashboardStats.memberGrowth.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Month-over-month member growth
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            <div className="grid gap-6">
              {userCommunities.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Communities Yet</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      Connect your Discord server to start monetizing your community.
                    </p>
                    <Button>
                      <Bot className="mr-2 h-4 w-4" />
                      Connect Discord Server
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userCommunities.map((community) => (
                    <CommunityOverview key={community.id} community={community} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Overview</CardTitle>
                  <CardDescription>
                    Manage your CommunityOS subscription and billing settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Current Plan</h4>
                      <p className="text-sm text-muted-foreground">Growth Plan - $99/month</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Next Billing Date</h4>
                      <p className="text-sm text-muted-foreground">January 15, 2025</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button variant="outline">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Update Payment Method
                    </Button>
                    <Button variant="outline">
                      View Invoices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}