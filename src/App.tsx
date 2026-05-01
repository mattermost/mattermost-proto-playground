import AppRouter from './router';
import MdxProvider from './guidelines/_provider/MdxProvider';

export default function App() {
  return (
    <MdxProvider>
      <AppRouter />
    </MdxProvider>
  );
}
