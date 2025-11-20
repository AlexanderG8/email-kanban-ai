import { Mail } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: "p-2 rounded-xl",
      icon: "h-5 w-5",
      title: "text-lg",
      subtitle: "text-[10px]",
      blur: "rounded-xl blur-lg",
    },
    md: {
      container: "p-3 rounded-2xl",
      icon: "h-8 w-8",
      title: "text-2xl",
      subtitle: "text-xs",
      blur: "rounded-2xl blur-xl",
    },
    lg: {
      container: "p-4 rounded-2xl",
      icon: "h-10 w-10",
      title: "text-3xl",
      subtitle: "text-sm",
      blur: "rounded-2xl blur-xl",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative">
        <div
          className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 ${classes.blur} opacity-50`}
        ></div>
        <div
          className={`relative bg-gradient-to-br from-blue-600 to-indigo-600 ${classes.container} shadow-lg`}
        >
          <Mail className={`${classes.icon} text-white`} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <h1
            className={`${classes.title} font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}
          >
            Email Kanban
          </h1>
          <p className={`${classes.subtitle} text-muted-foreground`}>
            Powered by AI
          </p>
        </div>
      )}
    </div>
  );
}
