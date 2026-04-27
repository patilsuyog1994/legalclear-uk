import { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "List Your Firm — LegalClear UK",
  description: "Add your solicitor firm to the LegalClear UK directory. Free listing, no referral fees. Reach people who need legal help across England, Wales, Scotland and Northern Ireland.",
};

export default function SolicitorRegisterPage() {
  return <RegisterForm />;
}
