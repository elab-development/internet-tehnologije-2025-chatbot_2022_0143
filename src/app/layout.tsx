import "./globals.css";
import MainHeader from "./components/MainHeader";

export const metadata = {
  title: "Travel Chatbot",
  description: "Chatbot za pomoć oko putovanja",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-[#FFF7E8] via-[#FFEFD7] to-[#FFE4B5] flex flex-col">
        <MainHeader />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
