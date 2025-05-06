import { Link } from "wouter";
import { Info, Lock, HelpCircle, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link href="/about">
              <a className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">About</span>
                <Info className="h-5 w-5" />
              </a>
            </Link>
            <Link href="/privacy">
              <a className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Privacy</span>
                <Lock className="h-5 w-5" />
              </a>
            </Link>
            <Link href="/help">
              <a className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Help</span>
                <HelpCircle className="h-5 w-5" />
              </a>
            </Link>
            <Link href="/contact">
              <a className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Contact</span>
                <Mail className="h-5 w-5" />
              </a>
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Odikpo Family Tree. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
