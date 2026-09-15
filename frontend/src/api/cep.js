// Busca de endereço por CEP via ViaCEP (API pública brasileira, sem chave).
export async function buscarEnderecoPorCep(cep) {
  const digitos = (cep || "").replace(/\D/g, "");
  if (digitos.length !== 8) return null;

  const res = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
  if (!res.ok) return null;
  const dados = await res.json();
  if (dados.erro) return null;

  return {
    logradouro: dados.logradouro || "",
    bairro: dados.bairro || "",
    municipio: dados.localidade || "",
    uf: dados.uf || "",
  };
}
