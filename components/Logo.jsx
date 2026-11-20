import Link from "next/link";
import { IconBolt } from "./Icons";

// Logo rasmi: ikon kilat kuning + "Copy" putih + "Laju" kuning + ".com" putih
export default function Logo({ href = "/", size, showCom = true, className = "" }) {
  return (
    <Link href={href} className={"logo " + className} style={size ? { fontSize: size } : undefined} aria-label="CopyLaju.com">
      <IconBolt />
      <span>
        <span className="l-copy">Copy</span>
        <span className="l-laju">Laju</span>
        {showCom && <span className="l-com">.com</span>}
      </span>
    </Link>
  );
}
