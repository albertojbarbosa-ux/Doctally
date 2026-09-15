namespace Doctally.Api.Services;

public interface IModuleAccessService
{
    Task<bool> ClinicaTemAcessoAsync(string moduloChave);
}
