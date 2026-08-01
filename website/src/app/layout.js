import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { ContactModalProvider } from "@/context/ContactModalContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: "Investor's World Realty | Invest, Grow, Rise",
  description:
    "At Investor's World Realty, we don't just sell properties — we build investors. Find your dream home, residential plot, or commercial space in Jaipur.",
  keywords: "real estate, Jaipur, plots, farmhouse, investment, properties",
  openGraph: {
    title: "Investor's World Realty",
    description: "Invest, Grow, and Rise with Realty",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}>
        <ContactModalProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ContactModalProvider>
      </body>
    </html>
  );
}
