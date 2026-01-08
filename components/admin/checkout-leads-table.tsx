"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Download, Eye, MessageCircle, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/db/schema";

/**
 * Componente de tabela para gerenciar leads de checkout
 * Exibe leads capturados do formulário de checkout
 * Permite visualizar, deletar e exportar dados completos
 */

interface CheckoutLeadsTableProps {
  initialLeads?: Lead[];
}

export default function CheckoutLeadsTable({ initialLeads = [] }: CheckoutLeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingConversion, setUpdatingConversion] = useState<Set<string>>(new Set());

  const pageSize = 20;

  // Carrega leads da API
  const loadLeads = async (search?: string, page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sourceType: 'checkout',
        page: page.toString(),
        limit: pageSize.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/leads?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setLeads(data.leads);
        setTotalLeads(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      } else {
        console.error('Erro ao carregar leads:', data.error);
      }
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega leads iniciais
  useEffect(() => {
    loadLeads();
  }, []);

  // Busca com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadLeads(query, 1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Paginação
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      loadLeads(query, page);
    }
  };

  // Toggle conversão do lead
  const handleToggleConversion = async (lead: Lead) => {
    const newValue = !lead.convertedToSale;
    
    // Adiciona ao set de atualizando
    setUpdatingConversion((prev) => new Set(prev).add(lead.id));

    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ convertedToSale: newValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao atualizar conversão");
        return;
      }

      // Atualiza o lead no estado local
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, convertedToSale: newValue, conversionDate: newValue ? new Date() : null }
            : l
        )
      );

      // Atualiza o selectedLead se estiver aberto nos detalhes
      if (selectedLead?.id === lead.id) {
        setSelectedLead((prev) =>
          prev ? { ...prev, convertedToSale: newValue, conversionDate: newValue ? new Date() : null } : null
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar conversão:", error);
      alert("Erro ao atualizar conversão");
    } finally {
      // Remove do set de atualizando
      setUpdatingConversion((prev) => {
        const newSet = new Set(prev);
        newSet.delete(lead.id);
        return newSet;
      });
    }
  };

  // Deleta lead
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja deletar o lead "${name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao deletar lead");
        return;
      }

      setLeads((prev) => prev.filter((l) => l.id !== id));
      setTotalLeads((prev) => prev - 1);
      alert(data.message);
    } catch (error) {
      console.error("Erro ao deletar lead:", error);
      alert("Erro ao deletar lead");
    }
  };

  // Exporta CSV
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        sourceType: 'checkout',
      });

      if (query) {
        params.append('search', query);
      }

      const response = await fetch(`/api/admin/leads/export?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Erro ao exportar leads");
        return;
      }

      // Download do arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_checkout_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao exportar leads:", error);
      alert("Erro ao exportar leads");
    }
  };

  // Mostra detalhes do lead
  const handleShowDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDetails(true);
  };

  // Formata data para exibição
  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formata telefones
  const formatPhone = (phone: string | null) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  // Formata CEP
  const formatPostalCode = (postalCode: string | null) => {
    if (!postalCode) return "-";
    const cleaned = postalCode.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return postalCode;
  };

  // Formata CPF/CNPJ
  const formatCpfCnpj = (cpfCnpj: string | null) => {
    if (!cpfCnpj) return "-";
    const cleaned = cpfCnpj.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    } else if (cleaned.length === 14) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
    }
    return cpfCnpj;
  };

  // Gera link do WhatsApp
  const getWhatsAppLink = (whatsapp: string) => {
    if (!whatsapp) return "#";
    // Remove caracteres não numéricos e adiciona 55 para Brasil
    const cleaned = whatsapp.replace(/\D/g, '');
    // Garante que comece com 55 (código do Brasil)
    const whatsappWithCountryCode = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
    return `https://wa.me/${whatsappWithCountryCode}`;
  };

  return (
    <div className="w-full">
      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Buscar por nome, WhatsApp, email ou CPF..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={handleExport}
            disabled={loading || leads.length === 0}
            className="flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Contador */}
      <div className="mb-4 text-sm text-muted-foreground">
        {loading ? (
          "Carregando..."
        ) : (
          <>
            Mostrando {leads.length} de {totalLeads} leads
            {query && ` (filtrados por "${query}")`}
          </>
        )}
      </div>

      {/* Tabela de leads com scroll horizontal em mobile */}
      <div className="border rounded-lg overflow-x-auto -mx-2 sm:mx-0">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead className="text-center">Convertido</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Carregando leads...
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nenhum lead encontrado
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="text-sm">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {lead.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatPhone(lead.whatsapp)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {lead.email || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatCpfCnpj(lead.cpfCnpj)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {lead.city && lead.state
                        ? `${lead.city}/${lead.state}`
                        : lead.city || lead.state || "-"
                      }
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleToggleConversion(lead)}
                        disabled={updatingConversion.has(lead.id)}
                        className={cn(
                          "inline-flex items-center justify-center h-7 w-7 rounded-md border-2 transition-all",
                          lead.convertedToSale
                            ? "bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600"
                            : "bg-white border-neutral-300 hover:border-neutral-400 dark:bg-neutral-800 dark:border-neutral-600",
                          updatingConversion.has(lead.id) && "opacity-50 cursor-wait"
                        )}
                        title={lead.convertedToSale 
                          ? `Convertido em ${lead.conversionDate ? formatDate(lead.conversionDate) : '-'}`
                          : "Marcar como convertido"
                        }
                      >
                        {updatingConversion.has(lead.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : lead.convertedToSale ? (
                          <Check className="h-4 w-4" strokeWidth={3} />
                        ) : null}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(getWhatsAppLink(lead.whatsapp), '_blank')}
                          disabled={loading || !lead.whatsapp}
                          title="Conversar no WhatsApp"
                          className="h-8 w-8 p-0"
                        >
                          <MessageCircle className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShowDetails(lead)}
                          disabled={loading}
                          title="Ver detalhes"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(lead.id, lead.name)}
                          disabled={loading}
                          title="Deletar"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Modal de detalhes */}
      {showDetails && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Detalhes do Lead</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDetails(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Nome</h4>
                <p className="font-medium">{selectedLead.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">WhatsApp</h4>
                <p className="font-mono">{formatPhone(selectedLead.whatsapp)}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Email</h4>
                <p>{selectedLead.email || "-"}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Telefone</h4>
                <p className="font-mono">{formatPhone(selectedLead.phone)}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">CPF/CNPJ</h4>
                <p className="font-mono">{formatCpfCnpj(selectedLead.cpfCnpj)}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">CEP</h4>
                <p className="font-mono">{formatPostalCode(selectedLead.postalCode)}</p>
              </div>
              <div className="sm:col-span-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Endereço</h4>
                <p>
                  {[
                    selectedLead.address,
                    selectedLead.addressNumber,
                    selectedLead.addressComplement
                  ].filter(Boolean).join(', ') || "-"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Cidade</h4>
                <p>{selectedLead.city || "-"}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Estado</h4>
                <p>{selectedLead.state || "-"}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Convertido</h4>
                <button
                  onClick={() => handleToggleConversion(selectedLead)}
                  disabled={updatingConversion.has(selectedLead.id)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all text-sm font-medium",
                    selectedLead.convertedToSale
                      ? "bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600"
                      : "bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300",
                    updatingConversion.has(selectedLead.id) && "opacity-50 cursor-wait"
                  )}
                >
                  {updatingConversion.has(selectedLead.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : selectedLead.convertedToSale ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <div className="h-4 w-4 rounded border border-neutral-400" />
                  )}
                  {selectedLead.convertedToSale ? "Sim" : "Não"}
                </button>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Data da Conversão</h4>
                <p>{selectedLead.conversionDate ? formatDate(selectedLead.conversionDate) : "-"}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Data de Cadastro</h4>
                <p>{formatDate(selectedLead.createdAt)}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">IP Address</h4>
                <p className="font-mono text-sm">{selectedLead.ipAddress || "-"}</p>
              </div>
            </div>

            {/* Metadados de UTM */}
            {(selectedLead.utmSource || selectedLead.utmMedium || selectedLead.utmCampaign) && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Metadados UTM</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Source:</span> {selectedLead.utmSource || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Medium:</span> {selectedLead.utmMedium || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Campaign:</span> {selectedLead.utmCampaign || "-"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}