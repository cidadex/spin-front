import { SubmitHandler, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AuthService } from "@/services/auth/AuthService";
import { ApiClient } from "@/services/api/ApiClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenerateSchema } from "@/hooks/useGenerateSchema/useGenerateSchema";
import { Separator } from "@/components/ui/separator";
import {
  generateLoginWithCodePageSchema,
  LoginWithCodePageSchema,
} from "../schemas";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
export const LoginWithCodeForm = ({
  code,
}: {
  email: string | null;
  code: string | null;
}) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const t = useTranslations();
  const loginPageShema = useGenerateSchema(generateLoginWithCodePageSchema);
  const form = useForm<LoginWithCodePageSchema>({
    resolver: zodResolver(loginPageShema),
    defaultValues: {
      email: undefined,
      code: code || "",
    },
  });

  const { handleSubmit } = form;

  const onValidSubmit = useMemo<SubmitHandler<LoginWithCodePageSchema>>(
    () => async (data) => {
      const authService = AuthService.getInstance();

      try {
        await authService.login({
          email: data.email,
          code: data.code,
        });
      } catch (error) {
        if (ApiClient.isApiClientError<{ error: string }>(error)) {
          const errorDetails = await error.details;
          setApiError(errorDetails?.error || t("loginPage.genericApiError"));
          return;
        }
        console.error("Login failed:", error);
      }
    },
    [t]
  );

  return (
    <Form {...form}>
      <form
        className="max-h-full w-full h-full flex flex-col relative overflow-hidden"
        onSubmit={handleSubmit(onValidSubmit)}
      >
        <header className="py-8 px-8 flex flex-col gap-2 items-start">
          <h4 className="text-gray-500 font-semibold text-xs text-left">
            {t("loginPage.loginWithCodeSubtitle")}
          </h4>
          <h3 className="font-semibold text-gray-800 text-lg">
            {t("loginPage.loginWithCodeTitle")}
          </h3>
        </header>
        <div className="overflow-hidden">
          <ScrollArea className="h-full max-h-full">
            <div className="flex flex-col gap-4 py-6 px-8 justify-center">
              <span className="text-gray-500 text-sm text-center font-medium">
                {t("loginPage.enterCodeInstruction")}
              </span>
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div>
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={field.onChange}
                          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                          inputMode="text"
                        >
                          <InputOTPGroup className="w-full gap-2">
                            <InputOTPSlot index={0} className="w-full" />
                            <InputOTPSlot index={1} className="w-full" />
                            <InputOTPSlot index={2} className="w-full" />
                            <InputOTPSlot index={3} className="w-full" />
                            <InputOTPSlot index={4} className="w-full" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {apiError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}
              {form.formState.errors &&
                Object.keys(form.formState.errors).length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertDescription>
                      {t("common.validation.invalidForm")}
                    </AlertDescription>
                  </Alert>
                )}
              <Button
                type="submit"
                className="cursor-pointer mb-4"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                )}
                {t("loginPage.loginWithCodeButton")}
              </Button>
              <p className="text-xs text-gray-600">
                {t("loginPage.termsAcceptance")}
              </p>
              <Separator />
              <div className="flex gap-2 items-center">
                <span className="material-symbols-outlined text-green-500">
                  shield
                </span>
                <strong className="font-semibold text-xs text-gray-700">
                  {t("loginPage.yourDataIsSafe")}
                </strong>
              </div>
            </div>
          </ScrollArea>
        </div>
      </form>
    </Form>
  );
};
