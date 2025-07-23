import "./globals.css";
import './styles/responsive.css'
import { ThemeProvider } from "@/components/ThemeContext";
import { AuthProvider } from '@/context/AuthContext';
import NavigationWrapper from "@/components/NavigationWrapper";

export const metadata = {
  title: "Chatrio - AI Chatbot Integration",
  description: "Advanced AI chatbot integration platform for seamless customer interactions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <NavigationWrapper>
              {children}
            </NavigationWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
