import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="text-center py-10 space-y-4 text-sm text-gray-600">
      <div className="flex justify-center items-center gap-4">
        <Image src="/images/mt_face.png" alt="Matthew" width={46} height={46} />
        <span className="font-bold">Matthew Truth</span>
        <Link href="https://github.com/truthofmatthew/" target="_blank" rel="noopener noreferrer">
          <Image src="/images/GitHub_Icon.svg" alt="GitHub" width={24} height={24} />
        </Link>
        <Link href="https://www.linkedin.com/in/truthofmatthew/" target="_blank" rel="noopener noreferrer">
          <Image src="/images/Linkedin_Icon.svg" alt="LinkedIn" width={24} height={24} />
        </Link>
      </div>
      <hr className="my-4" />
      <p>ساخته شده با 💙️ برای نُوشن‌بازها</p>
    </footer>
  );
}
