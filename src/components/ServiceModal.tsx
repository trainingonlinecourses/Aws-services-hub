'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Cloud,
  DollarSign,
  Zap,
  Shield,
  Users,
  Database,
  Box,
  Globe,
  FileText,
  ExternalLink,
  Tag
} from 'lucide-react';
import type { AWS_SERVICE_CATEGORIES, AwsService } from '@/lib/aws-types';

interface ServiceModalProps {
  service: AwsService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryIcons = {
  'Compute': Cloud,
  'Storage': Database,
  'Database': Database,
  'Networking': Globe,
  'Security': Shield,
  'Analytics': Users,
  'Machine Learning': Zap,
  'Developer Tools': Box,
  'Management Tools': FileText,
  'Migration': ExternalLink,
  'Application Integration': Tag,
  'End User Computing': Users,
  'Robotics': Box,
  'Satellite': Globe,
  'Blockchain': DollarSign,
  'Media Services': FileText,
  'Customer Engagement': Users,
  'Game Development': Zap,
  'IoT': Globe,
  'AR & VR': Box,
  'Business Applications': FileText,
  'Other': Tag
};

export function ServiceModal({ service, open, onOpenChange }: ServiceModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!service) {
    return null;
  }

  const IconComponent = categoryIcons[service.category as keyof typeof categoryIcons] || Box;

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IconComponent className="h-6 w-6 text-blue-600" />
            </div>
            {service.name}
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{service.category}</Badge>
              <Badge variant="outline">AWS {service.serviceType}</Badge>
              <span className="text-sm text-muted-foreground">
                {service.description}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 p-4">
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Overview</CardTitle>
                    <CardDescription>
                      {service.longDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Launch Date</h4>
                        <p className="text-sm text-muted-foreground">{service.launchDate}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Region Availability</h4>
                        <p className="text-sm text-muted-foreground">
                          {service.regions.join(', ')}
                        </p>
                      </div>
                    </div>
                    {service.stability && (
                      <div>
                        <h4 className="font-semibold mb-2">Stability</h4>
                        <Badge variant={service.stability === 'stable' ? 'default' : 'secondary'}>
                          {service.stability}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {service.relatedServices && service.relatedServices.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Services</CardTitle>
                      <CardDescription>
                        Services commonly used together with {service.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {service.relatedServices.map((relatedService) => (
                          <Badge key={relatedService} variant="outline">
                            {relatedService}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <h4 className="font-medium">{feature.name}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {service.advantages && service.advantages.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Advantages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {service.advantages.map((advantage, index) => (
                          <li key={index}>{advantage}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Pricing Model</Badge>
                        <span>{service.pricing.model}</span>
                      </div>

                      {service.pricing.details && (
                        <div>
                          <h4 className="font-semibold mb-2">Pricing Details</h4>
                          <p className="text-sm text-muted-foreground">{service.pricing.details}</p>
                        </div>
                      )}

                      {service.pricing.freeTier && (
                        <div>
                          <h4 className="font-semibold mb-2">Free Tier</h4>
                          <p className="text-sm text-muted-foreground">{service.pricing.freeTier}</p>
                        </div>
                      )}

                      {service.pricing.billing && (
                        <div>
                          <h4 className="font-semibold mb-2">Billing</h4>
                          <p className="text-sm text-muted-foreground">{service.pricing.billing}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="use-cases" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Use Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {service.useCases.map((useCase, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-2">{useCase.title}</h4>
                          <p className="text-sm text-muted-foreground">{useCase.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {service.examples && service.examples.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Implementation Examples</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {service.examples.map((example, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">{example.title}</h4>
                            <p className="text-sm text-muted-foreground">{example.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Official Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {service.documentationUrl && (
                        <Button
                          variant="outline"
                          onClick={() => handleExternalLink(service.documentationUrl!)}
                          className="w-full justify-start"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Official Documentation
                        </Button>
                      )}

                      {service.pricingUrl && (
                        <Button
                          variant="outline"
                          onClick={() => handleExternalLink(service.pricingUrl!)}
                          className="w-full justify-start"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Pricing Calculator
                        </Button>
                      )}

                      {service.tutorials && service.tutorials.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Tutorials & Guides</h4>
                          <div className="space-y-2">
                            {service.tutorials.map((tutorial, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                onClick={() => handleExternalLink(tutorial.url)}
                                className="w-full justify-start text-left"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {tutorial.title}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {service.compliance && service.compliance.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance & Certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {service.compliance.map((cert, index) => (
                          <Badge key={index} variant="outline">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}