import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Welcome() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>QuickSite CRM</CardTitle>
                    <CardDescription>Welcome to the future of CRM.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Button>Get Started</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
