import { useState } from 'react';
import Header from "@/components/Header";
import { Send, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    queryType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.queryType || !formData.message) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/mldwjzvg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          organization: formData.organization,
          queryType: formData.queryType,
          message: formData.message,
          subject: `InfraVision Contact - ${formData.queryType}`,
          _replyto: formData.email,
        }),
      });

      if (response.ok) {
        toast({
          title: "Message Sent",
          description: "Thank you for reaching out! We'll get back to you within 24 hours.",
        });

        setFormData({
          name: '',
          email: '',
          organization: '',
          queryType: '',
          message: ''
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Please try again or contact us directly at support@infravision.com",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-heading font-bold text-gradient">Contact Us</h1>
            <p className="text-muted-foreground text-lg">
              Have questions about InfraVision? We're here to help.
            </p>
          </div>

          <Card className="glass-card p-6 md:p-8 border-primary/20 shadow-xl">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Organization
                </label>
                <input
                  type="text"
                  placeholder="Company name or organization"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Query Type <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.queryType}
                  onChange={(e) => handleInputChange('queryType', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                >
                  <option value="">Select the type of help you need</option>
                  <option value="technical-support">Technical Support</option>
                  <option value="feature-request">Feature Request</option>
                  <option value="data-question">Data & Analytics Question</option>
                  <option value="account-billing">Account & Billing</option>
                  <option value="integration-help">Integration Help</option>
                  <option value="training-demo">Training & Demo Request</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="bug-report">Bug Report</option>
                  <option value="general">General Question</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Detailed Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  placeholder="Please describe your question or issue in detail..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                />
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div>
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    Quick Help Options
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• <strong>Documentation:</strong> Check our knowledge base</p>
                    <p>• <strong>Emergency Support:</strong> Call +91-800-HYDROGEN</p>
                  </div>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.name || !formData.email || !formData.queryType || !formData.message}
                  className="w-full md:w-auto px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
