import TopTicker from '../../components/TopTicker';
import BottomTicker from '../../components/BottomTicker';
import LeftPanel from '../../components/LeftPanel';
import '../styles/tokens.css';

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body className="bg-matte-black text-off-white">
        <TopTicker />
        <div className="flex">
          <LeftPanel />
          <main>{children}</main>
        </div>
        <BottomTicker />
      </body>
    </html>
  );
}
