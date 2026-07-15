import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
  <AuthProvider>
          {children}
        </AuthProvider> 
             </body>
    </html>
  );
}