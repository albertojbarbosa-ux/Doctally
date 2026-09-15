using Doctally.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Doctally.Api.Filters;

// Uso: [RequerModulo("prontuarios")] num controller/action. Ainda não aplicado em nenhum
// endpoint existente — infraestrutura pronta para quando Prontuário/Receituário/Faturamento
// forem implementados.
public class RequerModuloAttribute : TypeFilterAttribute
{
    public RequerModuloAttribute(string moduloChave) : base(typeof(RequerModuloFilter))
    {
        Arguments = new object[] { moduloChave };
    }
}

public class RequerModuloFilter : IAsyncActionFilter
{
    private readonly string _moduloChave;
    private readonly IModuleAccessService _acessoService;

    public RequerModuloFilter(string moduloChave, IModuleAccessService acessoService)
    {
        _moduloChave = moduloChave;
        _acessoService = acessoService;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var temAcesso = await _acessoService.ClinicaTemAcessoAsync(_moduloChave);
        if (!temAcesso)
        {
            context.Result = new ObjectResult(new
            {
                mensagem = $"Este recurso requer o módulo '{_moduloChave}', que sua clínica não tem contratado.",
                moduloChave = _moduloChave
            })
            { StatusCode = StatusCodes.Status402PaymentRequired };
            return;
        }

        await next();
    }
}
