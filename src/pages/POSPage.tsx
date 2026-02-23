import { POSProvider } from "@/context/POSContext";
import { POSAuthProvider, usePOSAuth } from "@/context/POSAuthContext";
import POSContent from "@/components/POSContent";
import POSLoginPage from "./POSLoginPage";

function POSRouteWrapper() {
  const { currentUser } = usePOSAuth();

  if (!currentUser) {
    return <POSLoginPage />;
  }

  return (
    <POSProvider>
      <POSContent />
    </POSProvider>
  );
}

export default function POSPage() {
  return (
    <POSAuthProvider>
      <POSRouteWrapper />
    </POSAuthProvider>
  );
}
