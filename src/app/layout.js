import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import GlobalPopup from "@/components/organisms/GlobalPopup";
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
          <GlobalPopup /> {/* <-- Place it here so it renders globally */}
        </AuthProvider>      
      </body>
    </html>
  );
}