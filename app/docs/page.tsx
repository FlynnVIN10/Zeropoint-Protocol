import { redirect } from 'next/navigation';

export default function DocsRoot() {
  redirect('/docs/v1');
}
