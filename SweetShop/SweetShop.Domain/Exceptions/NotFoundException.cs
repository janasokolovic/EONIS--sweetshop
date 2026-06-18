namespace SweetShop.Domain.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }

    public NotFoundException(string entityName, object key)
        : base($"Entitet '{entityName}' sa identifikatorom ({key}) nije pronađen.")
    {
    }
}