import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const columns = [
  {
    title: 'محصول',
    links: [
      { label: 'ویژگی‌ها', href: '#features' },
      { label: 'قیمت‌ها', href: '#pricing' },
      { label: 'چطور کار می‌کند', href: '#how' },
    ],
  },
  {
    title: 'شرکت',
    links: [
      { label: 'درباره ما', href: '/about' },
      { label: 'تماس', href: '/contact' },
      { label: 'وبلاگ', href: '/blog' },
    ],
  },
  {
    title: 'قانونی',
    links: [
      { label: 'حریم خصوصی', href: '/privacy' },
      { label: 'شرایط استفاده', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative pt-16 pb-8 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">راتایار</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              دستیار هوشمند زندگی از ۷ سال تا ۱۰۰ سال
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-bold text-white mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/50 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © ۱۴۰۵ راتایار. تمامی حقوق محفوظ است.
          </p>
          <p className="text-white/40 text-sm">
            ساخته شده با ❤️ در ایران
          </p>
        </div>
      </div>
    </footer>
  );
}
