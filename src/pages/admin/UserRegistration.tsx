// UserRegistration.tsx
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, type Resolver } from "react-hook-form";
import * as yup from "yup";
import { AdminLayout } from "../../layouts/AdminLayout";
import React from "react";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Enter valid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^\d{10}$/, "Enter valid 10-digit phone")
    .required("Phone is required"),
  password: yup.string().min(6, "Password min 6 chars").required("Password required"),
  access: yup.object({
    edit: yup.boolean().default(false),
    delete: yup.boolean().default(false),
    prices: yup.boolean().default(false),
    view: yup.boolean().default(false),
  }),
});

type FormData = yup.InferType<typeof schema>;

const permissions = ['edit', 'delete', 'prices', 'view'] as const;

export default function UserRegistration() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      access: { edit: false, delete: false, prices: false, view: false },
    },
  });

  const accessValues = watch("access");
  const areAllChecked = permissions.every((p) => accessValues?.[p]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    permissions.forEach((permission) => {
      setValue(`access.${permission}`, isChecked, { shouldValidate: true });
    });
  };

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    alert("✅ Registration successful!");
  };

  // Input fields ke liye thoda transparent background
  const inputClasses = "w-full rounded-lg border border-slate-300 bg-white/70 p-3 text-slate-800 placeholder:text-slate-500 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";


  return (
    <AdminLayout>
      {/* ✅ BACKGROUND IMAGE ADDED HERE */}
      <div
        className="flex min-h-screen items-center justify-center p-4 bg-cover bg-center"
        style={{ backgroundImage: "url('https://res.cloudinary.com/dmoqhod45/image/upload/v1759123866/register-img_b01kw6.jpg')" }}
      >
        {/* ✅ GLASSMORHISM EFFECT FOR FORM CARD */}
        <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
          <h1 className="mb-8 text-center text-3xl font-bold text-slate-800">
            User Registration
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Input fields... */}
            <div>
              <input
                {...register("name")}
                placeholder="Owner / Manager Name"
                className={inputClasses}
              />
              <p className="mt-1 text-sm text-red-600">{errors.name?.message}</p>
            </div>
            <div>
              <input
                {...register("email")}
                placeholder="Email Address"
                className={inputClasses}
              />
              <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
            </div>
            <div>
              <input
                {...register("phone")}
                placeholder="Phone Number"
                className={inputClasses}
              />
              <p className="mt-1 text-sm text-red-600">{errors.phone?.message}</p>
            </div>
            <div>
              <input
                type="password"
                {...register("password")}
                placeholder="Password"
                className={inputClasses}
              />
              <p className="mt-1 text-sm text-red-600">{errors.password?.message}</p>
            </div>

            {/* User Access Section... */}
            <div className="space-y-4 border-t border-slate-300/80 pt-5">
              <h2 className="text-lg font-semibold text-slate-700">User Access</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <label className="flex items-center space-x-3 font-medium text-slate-700"> {/* Changed text color for better contrast */}
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={areAllChecked}
                    className="h-5 w-5 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>All</span>
                </label>
                {permissions.map((permission) => (
                  <label key={permission} className="flex items-center space-x-3 capitalize text-slate-700"> {/* Changed text color */}
                    <input
                      type="checkbox"
                      {...register(`access.${permission}`)}
                      className="h-5 w-5 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{permission}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button (color matching sidebar) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-slate-700 py-3 font-semibold text-white transition duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:opacity-75"
            >
              {isSubmitting ? "Submitting..." : "Register User"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}