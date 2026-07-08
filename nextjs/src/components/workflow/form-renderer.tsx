/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Form, Field } from "../../types/workflow";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface FormRendererProps {
  form: Form;
  onSubmit: (data: Record<string, any>) => void;
  isSubmitting?: boolean;
}

export function FormRenderer({
  form,
  onSubmit,
  isSubmitting = false,
}: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Initialize form data with default values from fields
  useEffect(() => {
    const initialData: Record<string, any> = {};
    form.fields.forEach((field) => {
      if (field.value) {
        initialData[field.id] = field.value;
      }
    });
    setFormData(initialData);
  }, [form.fields]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    form.fields.forEach((field) => {
      const value = formData[field.id];

      // Required field validation
      if (field.required && (!value || value === "")) {
        newErrors[field.id] = `${field.label} is required`;
      }

      // Type-specific validation
      if (value && field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.id] = "Please enter a valid email address";
        }
      }

      if (value && field.type === "number") {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          newErrors[field.id] = "Please enter a valid number";
        }

        if (
          field.validation?.min !== undefined &&
          numValue < field.validation.min
        ) {
          newErrors[
            field.id
          ] = `Value must be at least ${field.validation.min}`;
        }

        if (
          field.validation?.max !== undefined &&
          numValue > field.validation.max
        ) {
          newErrors[field.id] = `Value must be at most ${field.validation.max}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Show success message if submitAction exists
      if (form.submitAction?.type === "message" && form.submitAction.message) {
        setShowSuccessMessage(true);
        // Hide the message after 3 seconds and then submit
        setTimeout(() => {
          setShowSuccessMessage(false);
          onSubmit(formData);
        }, 3000);
      } else {
        onSubmit(formData);
      }
    }
  };

  const renderField = (field: Field) => {
    const value = formData[field.id] || field.value || "";
    const error = errors[field.id];
    const isReadonly = field.readonly || false;

    switch (field.type) {
      case "text":
      case "email":
        return (
          <Input
            type={field.type}
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            readOnly={isReadonly}
            className={error ? "border-destructive" : ""}
            placeholder={isReadonly ? "" : `Enter ${field.label.toLowerCase()}`}
            required={field.required && !isReadonly}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            readOnly={isReadonly}
            min={field.validation?.min}
            max={field.validation?.max}
            className={error ? "border-destructive" : ""}
            placeholder={isReadonly ? "" : `Enter ${field.label.toLowerCase()}`}
            required={field.required && !isReadonly}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            readOnly={isReadonly}
            className={error ? "border-destructive" : ""}
            required={field.required && !isReadonly}
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleFieldChange(field.id, newValue)}
            disabled={isReadonly}
            required={field.required && !isReadonly}
          >
            <SelectTrigger className={error ? "border-destructive" : ""}>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            readOnly={isReadonly}
            rows={4}
            className={error ? "border-destructive" : ""}
            placeholder={isReadonly ? "" : `Enter ${field.label.toLowerCase()}`}
            required={field.required && !isReadonly}
          />
        );

      default:
        return (
          <div className="text-red-500">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      {/* Success Message */}
      {showSuccessMessage && form.submitAction?.type === "message" && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success!</h3>
              <p className="mt-1 text-sm text-green-700">
                {form.submitAction.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-2 text-gray-800">{form.title}</h2>
      {form.description && (
        <p className="text-gray-600 mb-6">{form.description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {form.fields.map((field) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {renderField(field)}

            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        ))}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}
