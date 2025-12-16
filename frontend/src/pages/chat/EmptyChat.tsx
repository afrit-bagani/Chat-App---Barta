import Logo from "@/components/Logo";

export default function EmptyChat() {
  return (
    <div className="w-full flex flex-1 flex-col justify-center items-center bg-[#1c1d25]">
      <Logo />
      <div>Start a new conversation</div>
    </div>
  );
}
