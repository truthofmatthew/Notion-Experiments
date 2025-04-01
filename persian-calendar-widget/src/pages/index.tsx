import Head from 'next/head';
import localFont from 'next/font/local';
import Hero from '../components/Hero';
import CalendarDemo from '../components/CalendarDemo';
import EaseOfUse from '../components/EaseOfUse';
import ColorSelection from '../components/ColorSelection';
import AddCalendar from '../components/AddCalendar';
import WhyPersianCalendar from '../components/WhyPersianCalendar';
import WidgetsList from '../components/WidgetsList';
import AboutMe from '../components/AboutMe';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const vazir = localFont({ src: '../fonts/Vazirmatn-Regular.woff2' });

export default function Home() {
  return (
    <div className={`${vazir.className} font-sans text-gray-800 max-w-5xl mx-auto p-6`}>
      <Head>
        <title>ویجت تقویم فارسی برای نُوشِن</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Hero />
      <CalendarDemo />
      <EaseOfUse />
      <ColorSelection />
      <AddCalendar />
      <WhyPersianCalendar />
      <WidgetsList />
      <AboutMe />
      <FAQ />
      <Footer />
    </div>
  );
}
