import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileProps {
  name: string;
  image?: string;
}

export function UserProfile({ name, image }: UserProfileProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 px-3 py-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src={image} alt={name} />
        <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{name}</span>
      </div>
    </div>
  );
}
