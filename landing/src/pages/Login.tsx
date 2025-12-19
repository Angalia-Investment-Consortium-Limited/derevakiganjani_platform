import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { User, Building2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Login</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <img src="/logo.png" alt="Dereva Kiganjani" className="h-[140px] w-auto mx-auto" />
              </div>
              <CardTitle className="text-3xl">Welcome to Dereva Kiganjani</CardTitle>
              <CardDescription className="text-lg">Choose your login type to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Driver Login */}
                <Link to="/auth/driver-login" className="block">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500">
                    <CardContent className="pt-6 text-center">
                      <div className="mx-auto mb-4 flex items-center justify-center">
                        <div className="bg-green-100 p-4 rounded-full">
                          <User className="h-12 w-12 text-green-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Driver</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Access driver services, tests, and job opportunities
                      </p>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Login as Driver
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                {/* Employer Login */}
                <Link to="/auth/employer-login" className="block">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-500">
                    <CardContent className="pt-6 text-center">
                      <div className="mx-auto mb-4 flex items-center justify-center">
                        <div className="bg-orange-100 p-4 rounded-full">
                          <Building2 className="h-12 w-12 text-orange-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Employer</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manage recruitment and find qualified drivers
                      </p>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Login as Employer
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    Register here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
