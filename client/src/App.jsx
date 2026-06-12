import Navbar from "./components/Navbar";
import { AppRouter } from "./router/AppRouter";
import { Analytics } from "@vercel/analytics/next";

export default function App() {
  return (
    <>
      <Navbar />
      <AppRouter />
      <Analytics />
    </>
  );
}
