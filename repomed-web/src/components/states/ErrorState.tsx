export function ErrorState({error}:{error:any}){
  const detail = error?.problem?.detail || error?.message || 'Erro inesperado';
  return <div role="alert" className="p-6 text-red-600">Erro: {detail}</div>;
}