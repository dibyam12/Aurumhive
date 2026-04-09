import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function NotFound() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
            <h1 className="font-brand text-[8rem] md:text-[10rem] leading-none bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                404
            </h1>
            <h2 className="text-2xl font-bold text-white mb-4">PAGE NOT FOUND</h2>
            <p className="text-slate-400 mb-8 max-w-md text-center">
                The page you are looking for might have been removed or is temporarily unavailable.
            </p>

            <Link
                to={isAuthenticated ? "/" : "/login"}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-black/30"
            >
                {isAuthenticated ? "Back to Dashboard" : "Go to Login"}
            </Link>
        </div>
    );
}
