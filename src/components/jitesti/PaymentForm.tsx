import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Smartphone, Banknote, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentFormProps {
  category: any;
  onSubmit: (paymentData: any) => Promise<void>;
  isProcessing: boolean;
}

export default function PaymentForm({
  category,
  onSubmit,
  isProcessing
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePayment = async () => {
    if (!paymentMethod) {
      return;
    }

    // For mobile payments, phone number is required
    if ((paymentMethod === 'M-Pesa' || paymentMethod === 'Airtel Money') && !phoneNumber) {
      return;
    }

    await onSubmit({
      paymentMethod,
      phoneNumber: phoneNumber || undefined
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
        <CardDescription>
          Choose how you want to pay for the {category.name_en} test
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* M-Pesa */}
        <div
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            paymentMethod === 'M-Pesa' ? 'border-green-500 bg-green-50' : 'border-gray-200'
          }`}
          onClick={() => setPaymentMethod('M-Pesa')}
        >
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium">M-Pesa</div>
              <div className="text-sm text-muted-foreground">
                Pay using M-Pesa mobile money
              </div>
            </div>
          </div>
        </div>

        {/* Airtel Money */}
        <div
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            paymentMethod === 'Airtel Money' ? 'border-red-500 bg-red-50' : 'border-gray-200'
          }`}
          onClick={() => setPaymentMethod('Airtel Money')}
        >
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-red-600" />
            <div>
              <div className="font-medium">Airtel Money</div>
              <div className="text-sm text-muted-foreground">
                Pay using Airtel Money
              </div>
            </div>
          </div>
        </div>

        {/* Bank Transfer */}
        <div
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            paymentMethod === 'Bank Transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          onClick={() => setPaymentMethod('Bank Transfer')}
        >
          <div className="flex items-center gap-3">
            <Banknote className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">Bank Transfer</div>
              <div className="text-sm text-muted-foreground">
                Pay via bank transfer or card
              </div>
            </div>
          </div>
        </div>

        {/* Phone Number Input for Mobile Payments */}
        {(paymentMethod === 'M-Pesa' || paymentMethod === 'Airtel Money') && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Payment Instructions</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Dial *150*00# (M-Pesa) or *211# (Airtel)</li>
                  <li>Select "Pay Bill" or "Lipa kwa M-Pesa"</li>
                  <li>Enter Business No: 123456</li>
                  <li>Enter Account No: JITESTI</li>
                  <li>Enter Amount: {category.price.toLocaleString()} TZS</li>
                  <li>Enter your PIN and confirm</li>
                  <li>Note the Transaction ID/M-Pesa code</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="255XXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handlePayment}
          disabled={!paymentMethod || isProcessing ||
            ((paymentMethod === 'M-Pesa' || paymentMethod === 'Airtel Money') && !phoneNumber)}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Pay {category.price.toLocaleString()} TZS
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
