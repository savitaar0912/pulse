import Navbar from "./components/Navbar";
import { AppRouter } from "./router/AppRouter";

export default function App() {
  return (
    <>
      <Navbar />
      <AppRouter />;
    </>
  );
}
