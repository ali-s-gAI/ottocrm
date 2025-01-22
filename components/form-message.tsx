export type Message = string | null;

export function FormMessage({
  message,
  type,
}: {
  message?: Message;
  type?: string;
}) {
  if (!message) return null;

  return (
    <p
      className={`mb-2 text-center text-sm ${
        type === "error" ? "text-red-500" : "text-green-500"
      }`}
    >
      {message}
    </p>
  );
}
