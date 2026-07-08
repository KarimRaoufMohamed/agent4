"use client";
import { useForm } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  ShadForm,
} from "./ui/shadcn-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectField from "./select-field";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { FormComponent } from "@/types/screens";

const Form: React.FC<FormComponent> = ({
  fields,
  formMethod,
  table_name,
  redirect_link,
  api_url,
}) => {
  const router = useRouter();
  const schema = z.object(
    fields.reduce((acc, field) => {
      acc[field.name] = field.validation
        ? z
            .string()
            .regex(eval(field.validation.regex), field.validation.message)
        : z.any();
      return acc;
    }, {} as Record<string, z.ZodTypeAny>)
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: fields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue || "";
      return acc;
    }, {} as Record<string, string>),
  });

  const watchValues = form.watch();

  const onSubmit = async (formValues: { [key: string]: string }) => {
    console.log(formValues);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NEXTJS_API_URL}${
        api_url ? api_url : "/api/form"
      }`,
      {
        method: formMethod,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formValues, table_name }),
      }
    );
    if (response.ok) {
      if (redirect_link) {
        router.push(redirect_link);
      }
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (form.formState.isSubmitting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin size-12" />
      </div>
    );
  }

  return (
    <ShadForm {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 w-full"
      >
        {fields.map((f) => (
          <FormField
            key={f.name}
            control={form.control}
            name={f.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{f.label}</FormLabel>
                <FormControl>
                  <div>
                    {f.fieldType === "input" && (
                      <Input
                        placeholder={f.placeholder}
                        {...field}
                        type={f.type}
                      />
                    )}
                    {f.fieldType === "textarea" && (
                      <Textarea
                        placeholder={f.placeholder}
                        rows={f.rows}
                        cols={f.cols}
                        {...field}
                      />
                    )}
                    {f.fieldType === "select" && (
                      <SelectField
                        relatedTable={f.relatedTable!}
                        selectKey={f.selectKey!}
                        selectName={f.selectName!}
                        value={field.value}
                        onChange={field.onChange}
                        filters={
                          f.filters
                            ? f.filters.map((f: { filterColumn: string | number; filterValue: string; }) => ({
                                filterColumn: f.filterColumn,
                                filterValue:
                                  f.filterValue === "fromForm"
                                    ? watchValues[f.filterColumn]
                                    : f.filterValue,
                              }))
                            : []
                        }
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button type="submit">Submit</Button>
      </form>
    </ShadForm>
  );
};

export default Form;
