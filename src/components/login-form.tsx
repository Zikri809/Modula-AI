"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <Card className="bg-black text-white border-neutral-600">
        <CardHeader>
          <CardTitle>Login / Sign Up to your account</CardTitle>
          <CardDescription className="text-neutral-400">
            Enter your email below to login/sign up to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="text-white">
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input className="border-neutral-500"
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/reset_password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input className="border-neutral-500" id="password" type="password" required />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full bg-neutral-700 hover:bg-neutral-400">
                  Login
                </Button>
                <Button variant="outline" className="w-full text-black hover:bg-neutral-400">
                  Login with Google
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
