import TopTicker from '../../components/TopTicker';
import BottomTicker from '../../components/BottomTicker';
import LeftPanel from '../../components/LeftPanel';
import '../../styles/tokens.css';
import RightPanel from '../../components/RightPanel';

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body className="bg-matte-black text-off-white">
        <TopTicker />
        <div className="flex">
          <LeftPanel />
          <main className="flex-1">{children}</main>
          <RightPanel />
        </div>
        <BottomTicker />
      </body>
    </html>
  );
}
