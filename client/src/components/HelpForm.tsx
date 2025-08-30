import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Send, HelpCircle } from "lucide-react";

interface HelpFormProps {
  onClose: () => void;
}

export default function HelpForm({ onClose }: HelpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    queryType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Hide the map and other elements
    const mapElements = document.querySelectorAll('.leaflet-container, [class*="map"], [id*="map"]');
    const savedStyles: { element: Element; display: string; visibility: string }[] = [];

    mapElements.forEach((el) => {
      const element = el as HTMLElement;
      savedStyles.push({
        element,
        display: element.style.display,
        visibility: element.style.visibility
      });
      element.style.visibility = 'hidden';
      element.style.pointerEvents = 'none';
    });

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      // Restore map visibility
      savedStyles.forEach(({ element, display, visibility }) => {
        const el = element as HTMLElement;
        el.style.display = display;
        el.style.visibility = visibility;
        el.style.pointerEvents = '';
      });
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.queryType || !formData.message) {
      showErrorToast('Please fill in all required fields');
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
          subject: `InfraVision Help Request - ${formData.queryType}`,
          _replyto: formData.email,
        }),
      });

      if (response.ok) {
        showSuccessToast("Thank you for reaching out! We'll get back to you within 24 hours.");

        setFormData({
          name: '',
          email: '',
          organization: '',
          queryType: '',
          message: ''
        });

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      showErrorToast('Please try again or contact us directly at support@infravision.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Full screen overlay that completely covers everything */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 999999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Modal Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '700px',
            maxHeight: '90vh',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden',
            border: '4px solid #2563eb',
            zIndex: 999999999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            backgroundColor: '#eff6ff',
            borderBottom: '3px solid #2563eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                backgroundColor: '#2563eb', 
                borderRadius: '50%', 
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#1e40af', 
                margin: 0 
              }}>
                Help & Support
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fee2e2',
                color: '#dc2626'
              }}
              data-testid="button-close-help"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div style={{ 
            padding: '24px', 
            backgroundColor: 'white',
            maxHeight: 'calc(90vh - 120px)',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    name="name"
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    data-testid="input-name"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@company.com"
                    value={formData.email}
                    name="email"
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    data-testid="input-email"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Organization
                </label>
                <input
                  type="text"
                  placeholder="Company name or organization"
                  value={formData.organization}
                  name="organization"
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  data-testid="input-organization"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Query Type *
                </label>
                <select
                  value={formData.queryType}
                  name="queryType"
                  onChange={(e) => handleInputChange('queryType', e.target.value)}
                  data-testid="select-query-type"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
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

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Detailed Message *
                </label>
                <textarea
                  placeholder="Please describe your question or issue in detail. Include any relevant information that might help us assist you better."
                  value={formData.message}
                  name="message"
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  data-testid="textarea-message"
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div style={{
                backgroundColor: '#eff6ff',
                border: '2px solid #bfdbfe',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1e40af' }}>
                  Quick Help Options
                </h4>
                <div style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.6' }}>
                  <p style={{ margin: '6px 0' }}>• <strong>Documentation:</strong> Check our knowledge base at docs.infravision.com</p>
                  <p style={{ margin: '6px 0' }}>• <strong>Video Tutorials:</strong> Watch getting started videos</p>
                  <p style={{ margin: '6px 0' }}>• <strong>Community:</strong> Join our Slack community for peer support</p>
                  <p style={{ margin: '6px 0' }}>• <strong>Emergency Support:</strong> Call +91-800-HYDROGEN for urgent issues</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px' }}>
                <button
                  onClick={onClose}
                  data-testid="button-cancel-help"
                  style={{
                    padding: '12px 24px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.name || !formData.email || !formData.queryType || !formData.message}
                  data-testid="button-submit-help"
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: isSubmitting || !formData.name || !formData.email || !formData.queryType || !formData.message ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isSubmitting || !formData.name || !formData.email || !formData.queryType || !formData.message ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }
                  }}
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
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.4)',
            border: '2px solid',
            zIndex: 999999999,
            backgroundColor: toastType === 'success' ? '#10b981' : '#ef4444',
            borderColor: toastType === 'success' ? '#059669' : '#dc2626',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '400px'
          }}
        >
          {toastMessage}
        </div>
      )}
    </>
  );
}