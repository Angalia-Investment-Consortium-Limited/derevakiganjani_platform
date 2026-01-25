import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { FrappeError } from "frappe-react-sdk";
import { useFrappePostCall } from "frappe-react-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import derevaLogo from "../../assets/logo.png";

interface ForgotPasswordInput {
    user: string;
}

const ForgotPassword = () => {
    const { t } = useLanguage();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordInput>();
    const [callout, setCallout] = useState<{ state: boolean; message: string } | null>(null);
    const { toast } = useToast();

    // POST Call to send reset password instructions on email
    const { call, error } = useFrappePostCall('frappe.core.doctype.user.user.reset_password');

    async function resetPassword(values: ForgotPasswordInput) {
        return call({
            user: values.user,
        })
            .then((res) => {
                setCallout({
                    state: true,
                    message: "Password reset instructions have been sent to your email.",
                });
                toast({
                    title: t('success'),
                    description: "Password reset instructions have been sent to your email.",
                });
            }).catch((err) => {
                setCallout(null);
                toast({
                    title: t('error'),
                    description: "Failed to send reset instructions. Please try again.",
                    variant: 'destructive',
                });
            });
    }

    // TO-DO: To be removed once ErrorBanner/ ErrorCallout is fixed.
    const generateErrorMessage = (error: FrappeError) => {
        if (error.exc_type === "ValidationError") return 'Too many requests. Please try after some time.';
        return 'User does not exist. Please Sign Up.';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center">
                        <img src={derevaLogo} alt="Dereva Kiganjani" className="h-[140px] w-auto mx-auto" />
                    </div>
                    <CardTitle className="text-2xl text-center">{t('forgotPassword')}</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address to receive password reset instructions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="p-4 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                            {generateErrorMessage(error)}
                        </div>
                    )}
                    {callout && callout.state && (
                        <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                            {callout.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(resetPassword)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="user">
                                Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                {...register("user", {
                                    required: "Email is required.",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Please enter a valid email address.",
                                    },
                                })}
                                name="user"
                                type="email"
                                placeholder="jane@example.com"
                                disabled={isSubmitting}
                                autoFocus
                            />
                            {errors?.user && (
                                <p className="text-sm text-destructive">{errors.user.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Reset Password'}
                        </Button>

                        <div className="text-center text-sm">
                            <Link
                                to="/ingia"
                                className="text-muted-foreground hover:text-primary"
                            >
                                {t('backToLogin')}
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
