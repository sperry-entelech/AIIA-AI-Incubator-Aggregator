'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, Bot, CreditCard, Users, BarChart3, Shield, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const features = [
  {
    icon: Bot,
    title: 'Smart Discord Bot',
    description: 'Automated role management, payment verification, and member onboarding with real-time Discord integration.',
  },
  {
    icon: CreditCard,
    title: 'Stripe Integration',
    description: 'Seamless billing with subscription management, one-time payments, and automated invoice generation.',
  },
  {
    icon: Users,
    title: 'Member Management',
    description: 'Comprehensive member database with subscription tracking, engagement analytics, and retention insights.',
  },
  {
    icon: BarChart3,
    title: 'Revenue Analytics',
    description: 'Real-time revenue tracking, growth metrics, churn analysis, and detailed financial reporting.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 compliant infrastructure with data encryption, audit logs, and role-based access control.',
  },
  {
    icon: Zap,
    title: 'Multi-tenant Architecture',
    description: 'Scalable platform serving thousands of communities with isolated data and custom branding.',
  },
];

const testimonials = [
  {
    quote: "CommunityOS helped us generate $50K in monthly recurring revenue from our gaming community of 25,000 members.",
    author: "Alex Chen",
    title: "Founder of GamersUnite",
    avatar: "/avatars/alex-chen.jpg",
  },
  {
    quote: "The automated billing and role management saved us 40 hours per week. Game changer for community management.",
    author: "Sarah Johnson",
    title: "Creator Economy Expert",
    avatar: "/avatars/sarah-johnson.jpg",
  },
  {
    quote: "Finally, a platform built specifically for Discord communities. The integration is seamless and powerful.",
    author: "Mike Rodriguez",
    title: "Community Manager",
    avatar: "/avatars/mike-rodriguez.jpg",
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: '$29',
    interval: 'month',
    description: 'Perfect for growing communities',
    features: [
      'Up to 1,000 members',
      'Basic Discord bot',
      'Stripe integration',
      'Community dashboard',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Growth',
    price: '$99',
    interval: 'month',
    description: 'Scale your community business',
    features: [
      'Up to 10,000 members',
      'Advanced bot features',
      'Multiple subscription tiers',
      'Analytics & insights',
      'Custom branding',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Scale',
    price: '$299',
    interval: 'month',
    description: 'Enterprise-grade solution',
    features: [
      'Unlimited members',
      'White-label solution',
      'API access',
      'Advanced integrations',
      'Dedicated support',
      'Custom development',
    ],
    popular: false,
  },
];

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              🚀 Trusted by 1,000+ Discord Communities
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Transform Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Discord Community
              </span>
              {' '}Into Revenue
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The complete SaaS platform for Discord community monetization. 
              Automated billing, member management, and premium features in one integrated solution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {status === 'authenticated' ? (
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link href="/auth/signin">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/demo">
                  Watch Demo
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Monetize</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Discord communities with all the tools you need to generate recurring revenue.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Community Leaders</h2>
            <p className="text-xl text-muted-foreground">
              See how communities are transforming their Discord servers into thriving businesses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <blockquote className="text-lg mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your community size and growth goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative border-2 ${tier.popular ? 'border-blue-500 shadow-xl' : 'border-border'}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">/{tier.interval}</span>
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/auth/signin">
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Need a custom solution for your enterprise?
            </p>
            <Button variant="outline" asChild>
              <Link href="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Monetize Your Discord Community?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of community owners who are generating recurring revenue 
              with CommunityOS. Start your free trial today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6" asChild>
                <Link href="/auth/signin">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6" asChild>
                <Link href="/docs">
                  Read Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}