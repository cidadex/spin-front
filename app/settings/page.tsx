"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { useTerms } from "@/hooks/useTerms/useTerms";
import { AuthStatusEnum, TermTypeEnum } from "@/types/enums";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { TermButton } from "../components/terms";
import { PageTitle } from "../components/page-title/PageTitle";
import { SpinCardTitle } from "../components/spin-card-title/SpinCardTitle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      <SettingsPage />
    </ProtectedRoute>
  );
}

const SettingsPage = () => {
  const t = useTranslations("settingsPage");
  return (
    <div className="container">
      <div className="min-h-screen w-full flex flex-col gap-4 pb-4">
        <PageTitle title={t("title")} />
        <SettingsPageHeader />
        <SettingsPageUserSection />
        <SettingsPageSystemSection />
        <SettingsPageSecuritySection />
        <SettingsPageTermsSection />
        <DeleteAccountSection />
      </div>
    </div>
  );
};

const SettingsPageHeader = () => {
  const t = useTranslations("settingsPage");
  const { me } = useAuth();

  const userName = me ? `${me.first_name} ${me.last_name}` : "";
  const userInitials = useMemo(() => {
    const nameParts = userName.split(" ");
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const lastInitial =
      nameParts.length > 1
        ? nameParts[nameParts.length - 1].charAt(0).toUpperCase()
        : "";
    return firstInitial + lastInitial;
  }, [userName]);

  return (
    <Card className="flex-1 pt-0">
      <SpinCardTitle centered title={t("subtitle")} />
      <CardContent className="flex flex-col gap-4 items-center justify-center">
        <Avatar className="w-20 h-20">
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <Button>
          <span className="material-symbols-outlined">search</span>
          {t("changePhoto")}
        </Button>
      </CardContent>
    </Card>
  );
};

const SettingsPageUserSection = () => {
  const t = useTranslations("settingsPage.userSection");
  const { me } = useAuth();
  const form = useForm();
  return (
    <Form {...form}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined leading-none text-indigo-600">
              calculate
            </span>
            <h2 className="font-bold">{t("title")}</h2>
          </div>
        </CardHeader>
        <CardContent className="px-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md rounded-b-none">
            <FormItem>
              <FormLabel>{t("first_name")}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    value={me?.first_name}
                    readOnly
                  />
                  <InputGroupAddon>
                    <span className="material-symbols-outlined">person</span>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>{t("last_name")}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput type="text" value={me?.last_name} readOnly />
                  <InputGroupAddon>
                    <span className="material-symbols-outlined">person</span>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput type="email" value={me?.email} readOnly />
                  <InputGroupAddon>
                    <span className="material-symbols-outlined">email</span>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>{t("oab_number")}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput type="text" readOnly />
                  <InputGroupAddon>
                    <span className="material-symbols-outlined">id_card</span>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
            </FormItem>
          </div>
          <Separator />
        </CardContent>
        <CardFooter>
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline">{t("cancelButton")}</Button>
            <Button variant="outline">
              <span className="material-symbols-outlined leading-none text-indigo-600">
                calculate
              </span>
              {t("saveChangesButton")}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Form>
  );
};

const SettingsPageSystemSection = () => {
  const t = useTranslations("settingsPage.systemSection");
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined leading-none text-indigo-600">
            calculate
          </span>
          <h2 className="font-bold">{t("title")}</h2>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex flex-col px-4 bg-gray-50 rounded-md rounded-b-none">
          <div className="flex gap-2 items-center py-4">
            <section className="flex flex-1 flex-col gap-2">
              <span className="text-sm font-medium text-gray-900">
                {t("emailNotifications.title")}
              </span>
              <span className="text-xs text-gray-800">
                {t("emailNotifications.description")}
              </span>
            </section>
            <div className="flex items-center gap-2">
              <Switch id="email-notifications" />
              <Label htmlFor="email-notifications">{t("enabled")}</Label>
            </div>
          </div>
          <Separator />
          <div className="flex gap-2 items-center py-4">
            <section className="flex flex-1 flex-col gap-2">
              <span className="text-sm font-medium text-gray-900">
                {t("autoSaveDrafts.title")}
              </span>
              <span className="text-xs text-gray-800">
                {t("autoSaveDrafts.description")}
              </span>
            </section>
            <div className="flex items-center gap-2">
              <Switch id="email-notifications" />
              <Label htmlFor="email-notifications">{t("enabled")}</Label>
            </div>
          </div>
          <Separator />
        </div>
      </CardContent>
    </Card>
  );
};

const SettingsPageSecuritySection = () => {
  const t = useTranslations("settingsPage.securitySection");
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined leading-none text-indigo-600">
            calculate
          </span>
          <h2 className="font-bold">{t("title")}</h2>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex flex-col px-4 bg-gray-50 rounded-md rounded-b-none">
          <div className="flex gap-2 items-center py-4">
            <section className="flex flex-1 flex-col gap-2">
              <span className="text-sm font-medium text-gray-900">
                {t("changePassword.title")}
              </span>
              <span className="text-xs text-gray-800">
                {t("changePassword.description")}
              </span>
            </section>
            <Button variant="outline" size="sm">
              {t("changePasswordButton")}
            </Button>
          </div>
          <Separator />
          <div className="flex gap-2 items-center py-4">
            <section className="flex flex-1 flex-col gap-2">
              <span className="text-sm font-medium text-gray-900">
                {t("twoFactor.title")}
              </span>
              <span className="text-xs text-gray-800">
                {t("twoFactor.description")}
              </span>
            </section>
            <Button variant="outline" size="sm">
              {t("configureButton")}
            </Button>
          </div>
          <Separator />
        </div>
      </CardContent>
    </Card>
  );
};

const SettingsPageTermsSection = () => {
  const t = useTranslations("settingsPage.termsSection");

  const { fetchAcceptanceTerms, fetchLatestTerms, latestTerms } = useTerms();

  const privacyTerm = useMemo(() => {
    return latestTerms.find((term) => term.type === TermTypeEnum.Privacy);
  }, [latestTerms]);

  const useTerm = useMemo(() => {
    return latestTerms.find((term) => term.type === TermTypeEnum.Use);
  }, [latestTerms]);

  useEffect(() => {
    fetchLatestTerms();
  }, [fetchLatestTerms]);

  useEffect(() => {
    fetchAcceptanceTerms();
  }, [fetchAcceptanceTerms]);

  const mostRecentDate = useMemo(() => {
    const useTermDate = useTerm ? new Date(useTerm.created_at) : null;
    const privacyTermDate = privacyTerm
      ? new Date(privacyTerm.created_at)
      : null;

    if (useTermDate && privacyTermDate) {
      return useTermDate > privacyTermDate ? useTermDate : privacyTermDate;
    }
    return useTermDate || privacyTermDate;
  }, [useTerm, privacyTerm]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined leading-none text-indigo-600">
            calculate
          </span>
          <h2 className="font-bold">{t("title")}</h2>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col px-4 bg-gray-50 rounded-md rounded-b-none">
          <div className="flex gap-2 items-center py-4">
            <section className="flex flex-1 flex-col gap-2">
              <span className="text-sm font-medium text-gray-900">
                {t("sectionTitle")}
              </span>
              <span className="text-xs text-gray-800">
                {t("version", {
                  date: mostRecentDate
                    ? mostRecentDate.toLocaleDateString("pt-BR")
                    : "",
                })}
              </span>
            </section>
          </div>
          <Separator />
        </div>
        <div className="flex gap-4 flex-wrap items-center justify-center">
          {privacyTerm && <TermButton term={privacyTerm} />}
          {useTerm && <TermButton term={useTerm} />}
        </div>
      </CardContent>
    </Card>
  );
};

const DeleteAccountSection = () => {
  const t = useTranslations("settingsPage.deleteAccountSection");
  return (
    <Card className="border-red-200 bg-red-50 text-red-700">
      <CardHeader>
        <div className="flex items-center gap-2">
          <h2 className="font-bold">{t("title")}</h2>
        </div>
      </CardHeader>
      <CardContent>
        <Button variant="destructive">
          <span className="material-symbols-outlined leading-none">delete</span>
          {t("deleteAccountButton")}
        </Button>
        <p className="mt-4 text-xs">{t("description")}</p>
      </CardContent>
    </Card>
  );
};
