import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import GlobalPopup from "@/components/organisms/GlobalPopup";

export const metadata = {
  title: {
    default: "Uttirna DigiLabs",
    template: "%s | Uttirna DigiLabs",
  },
  description:
    "Language Lab is a digital language-learning platform with courses, practice modules, and progress tracking for students and institutes.",
  icons: {
    icon: "/collage-logo.png",
  },
};

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