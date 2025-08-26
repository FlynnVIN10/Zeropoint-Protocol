import PromptPane from '../../components/PromptPane';
import ChainOfThought from '../../components/ChainOfThought';

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <PromptPane />
      <ChainOfThought />
    </div>
  );
}
