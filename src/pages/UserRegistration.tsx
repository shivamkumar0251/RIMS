// UserRegistration.tsx
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, type Resolver } from "react-hook-form";
import * as yup from "yup";
import { AdminLayout } from "../layouts/AdminLayout";

// ✅ Validation schema
const schema = yup.object({
  franchiseName: yup.string().required("Franchise name is required"),
  ownerName: yup.string().required("Owner / Manager name is required"),
  email: yup.string().email("Enter valid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^\d{10}$/, "Enter valid 10-digit phone")
    .required("Phone is required"),
  password: yup.string().min(6, "Password min 6 chars").required("Password required"),
  address: yup.string().required("Address is required"),
  pinCode: yup
    .string()
    .matches(/^\d{6}$/, "Enter 6-digit pin code")
    .required("Pin code required"),
  gst: yup.string().notRequired(), // ✅ optional
});

type FormData = yup.InferType<typeof schema>;

export default function UserRegistration() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      gst: undefined, // ✅ matches optional type
    },
  });

  // ✅ TS now infers `FormData` automatically
  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    alert("✅ Registration successful!");
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className=" p-10 rounded-2xl shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center text-purple-600">
            User Registration
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Franchise Name */}
            <div>
              <input
                {...register("franchiseName")}
                placeholder="Franchise Name"
                className="text-black w-full color-black border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
              <p className="text-red-600 text-sm mt-1">{errors.franchiseName?.message}</p>
            </div>

            {/* Owner Name */}
            <div>
              <input
                {...register("ownerName")}
                placeholder="Owner / Manager Name"
                className="text-black w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
              <p className="text-red-600 text-sm mt-1">{errors.ownerName?.message}</p>
            </div>

            {/* Email */}
            <div>
              <input
                {...register("email")}
                placeholder="Email Address"
                className="text-black w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
              <p className="text-red-600 text-sm mt-1">{errors.email?.message}</p>
            </div>

            {/* Phone */}
            <div>
              <input
                {...register("phone")}
                placeholder="Phone Number"
                className="text-black w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
              <p className="text-red-600 text-sm mt-1">{errors.phone?.message}</p>
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                {...register("password")}
                placeholder="Password"
                className="text-black w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
              <p className="text-red-600 text-sm mt-1">{errors.password?.message}</p>
            </div>

            {/* Address */}
            <div>
              <textarea
                {...register("address")}
                placeholder="Branch Address"
                className="text-black w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition resize-none"
                rows={3}
              />
              <p className="text-red-600 text-sm mt-1">{errors.address?.message}</p>
            </div>

            {/* Pin Code */}
            <div>
              <input
                {...register("pinCode")}
                placeholder="Pin Code"
                className="text-black w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
              <p className="text-red-600 text-sm mt-1">{errors.pinCode?.message}</p>
            </div>

            {/* GST */}
            <div>
              <input
                {...register("gst")}
                placeholder="GST / Tax Number (optional)"
                className="text-black w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
              <p className="text-red-600 text-sm mt-1">{errors.gst?.message}</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              {isSubmitting ? "Submitting..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
