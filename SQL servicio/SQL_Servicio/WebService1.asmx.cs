using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Text;
using System.Xml.Linq;
using Newtonsoft;
using Newtonsoft.Json;

namespace SQL_Servicio
{
    /// <summary>
    /// Descripción breve de WebService1
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    [ScriptService]
    // Para permitir que se llame a este servicio web desde un script, usando ASP.NET AJAX, quite la marca de comentario de la línea siguiente. 
    // [System.Web.Script.Services.ScriptService]
    public class WebService1 : System.Web.Services.WebService
    {

        [WebMethod]
        public bool ConnectToSql(string host, string port, string user, string password)
        {
            string database = "master"; // Reemplaza con el nombre de tu base de datos

            string connectionString = $"Data Source={host},{port};Initial Catalog={database};User ID={user};Password={password};";

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    return true;
                }
            }
            catch (SqlException ex)
            {
                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public string GetDatabases(string host, string port, string user, string password)
        {
            try
            {
                string connectionString = $"Data Source={host},{port};User ID={user};Password={password};";

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string query = "SELECT name FROM sys.databases WHERE database_id > 4;";
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            List<string> databases = new List<string>();

                            while (reader.Read())
                            {
                                string dbName = reader["name"].ToString();
                                databases.Add(dbName);
                            }
                            string result = string.Join(",", databases);
                            connection.Close();
                            return result;
                        }
                    }
                }
            }
            catch (SqlException ex)
            {
                return $"{{ \"error\": \"{ex.Message}\" }}";
            }
            catch (Exception ex)
            {
                return $"{{ \"error\": \"{ex.Message}\" }}";
            }
        }


        public string GetTables(string host, string port, string user, string password, string databaseName)
        {
            List<string> tables = new List<string>();

            try
            {
                string connectionString = $"Data Source={host},{port};User ID={user};Password={password};Initial Catalog={databaseName};";

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string query = "SELECT table_name = t.name FROM sys.tables t INNER JOIN sys.schemas s ON t.schema_id = s.schema_id;";
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                string tableName = reader["table_name"].ToString();
                                tables.Add(tableName);
                            }
                        }
                    }
                    connection.Close();
                    // Devolver solo los nombres de las tablas
                    string tablasDev = string.Join(",", tables);
                    return tablasDev;
                }
            }
            catch (SqlException ex)
            {
                return $"{{ \"error\": \"{ex.Message}\" }}";
            }
            catch (Exception ex)
            {
                return $"{{ \"error\": \"{ex.Message}\" }}";
            }
        }


        public string ExecuteQuery(string host, string port, string user, string password, string databaseName, string query)
        {
            try
            {
                string connectionString = $"Data Source={host},{port};User ID={user};Password={password};Initial Catalog={databaseName};";

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        // Construir la respuesta XML
                        XDocument xmlResult = new XDocument(new XElement("Result"));

                        try
                        {
                            using (SqlDataReader reader = command.ExecuteReader())
                            {
                                // Si la consulta es SELECT, procesar y agregar los resultados
                                if (reader.HasRows)
                                {
                                    // Obtener nombres de columnas
                                    List<string> columnNames = new List<string>();
                                    for (int i = 0; i < reader.FieldCount; i++)
                                    {
                                        columnNames.Add(reader.GetName(i));
                                    }

                                    XElement columnsElement = new XElement("Columns");
                                    foreach (string columnName in columnNames)
                                    {
                                        columnsElement.Add(new XElement("Column", columnName));
                                    }
                                    xmlResult.Root.Add(columnsElement);

                                    XElement rowsElement = new XElement("Rows");

                                    while (reader.Read())
                                    {
                                        XElement rowElement = new XElement("Row");
                                        for (int i = 0; i < reader.FieldCount; i++)
                                        {
                                            object value = reader.GetValue(i);
                                            rowElement.Add(new XElement(columnNames[i], value));
                                        }
                                        rowsElement.Add(rowElement);
                                    }

                                    xmlResult.Root.Add(rowsElement);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            // Manejar el error al ejecutar la consulta SELECT
                            return $"<Result><Error>{ex.Message}</Error></Result>";
                        }

                        // Si la consulta no es SELECT, ejecutar y agregar el número de filas afectadas
                        int rowsAffected = command.ExecuteNonQuery();
                        xmlResult.Root.Add(new XElement("RowsAffected", rowsAffected));

                        // Devolver la respuesta como una cadena
                        string resultado=xmlResult.ToString();
                        connection.Close();
                        return resultado;
                    }
                }
            }
            catch (SqlException ex)
            {
                // Puedes manejar el error según tus necesidades, por ejemplo, registrándolo o devolviendo un mensaje de error
                return $"<Result><Error>SQL Server Error: {ex.Message}</Error></Result>";
            }
            catch (Exception ex)
            {
                // Puedes manejar otros errores aquí
                return $"<Result><Error>Error: {ex.Message}</Error></Result>";
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public void DevolverBasesJson(string host, string port, string user, string password)
        {
            Context.Response.Write(DevolverBasesSerializadasJSON(host,  port,  user,  password));
        }

        public string DevolverBasesSerializadasJSON(string host, string port, string user, string password)
        {
            string mensajeJson = JsonConvert.SerializeObject(GetDatabases(host, port, user, password));
            return mensajeJson;
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public void DevolverTablasJson(string host, string port, string user, string password, string databaseName)
        {
            Context.Response.Write(DevolverTablasSerializadasJSON(host, port, user, password, databaseName));
        }

        public string DevolverTablasSerializadasJSON(string host, string port, string user, string password, string databaseName)
        {
            string mensajeJson = JsonConvert.SerializeObject(GetTables(host, port, user, password, databaseName));
            return mensajeJson;
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public void DevolverQueryJson(string host, string port, string user, string password, string databaseName, string query)
        {
            Context.Response.Write(DevolverQuerySerializadoJSON(host, port, user, password, databaseName, query));
        }

        public string DevolverQuerySerializadoJSON(string host, string port, string user, string password, string databaseName, string query)
        {
            string mensajeJson = JsonConvert.SerializeObject(ExecuteQuery(host, port, user, password, databaseName, query));
            return mensajeJson;
        }
    }
}
