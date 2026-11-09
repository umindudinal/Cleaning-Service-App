export default function BrandLogo({ className = 'w-10 h-10' }) {
  return (
    <div
      className={`bg-[#1E3A8A] flex items-center justify-center rounded-[14px] shadow-md shadow-slate-900/20 shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="white"
        className="w-[58%] h-[58%]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16 11h-1V4c0-1.66-1.34-3-3-3S9 2.34 9 4v7H8c-2.76 0-5 2.24-5 5v5c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5c0-2.76-2.24-5-5-5zm3 10h-2v-3c0-.55-.45-1-1-1s-1 .45-1 1v3h-2v-3c0-.55-.45-1-1-1s-1 .45-1 1v3H9v-3c0-.55-.45-1-1-1s-1 .45-1 1v3H5v-5c0-1.65 1.35-3 3-3h8c1.65 0 3 1.35 3 3v5z" />
      </svg>
    </div>
  );
}
