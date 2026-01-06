
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Download, Calculator, FileText, User, ShoppingBag, 
  Percent, ArrowRight, CheckCircle, Info
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Client, BudgetItem } from '../types';

export const BudgetCalculator: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cliente'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });
    return () => unsub();
  }, []);

  const addItem = () => {
    const newItem: BudgetItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + (subtotal * (tax / 100)) - discount;

  const handleGeneratePDF = () => {
    alert("Funcionalidade de PDF: Em um ambiente real, aqui usaríamos jspdf para gerar o orçamento personalizado da JPS Steel.");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Simulador de Orçamento</h1>
          <p className="text-slate-500">Calcule e gere orçamentos profissionais instantaneamente.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setItems([])}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors font-medium"
          >
            Limpar
          </button>
          <button 
            onClick={handleGeneratePDF}
            disabled={items.length === 0 || !selectedClientId}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            <Download size={18} />
            <span>Gerar PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 text-blue-600">
              <User size={20} />
              <h3 className="font-bold">Informações do Cliente</h3>
            </div>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 font-medium"
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
            >
              <option value="">Selecione um cliente cadastrado...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.displayName} ({c.cnpj})</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-blue-600">
                <ShoppingBag size={20} />
                <h3 className="font-bold">Itens do Orçamento</h3>
              </div>
              <button 
                onClick={addItem}
                className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors flex items-center space-x-1 text-sm font-bold"
              >
                <Plus size={16} /> <span>Adicionar Item</span>
              </button>
            </div>
            
            <div className="p-6">
              {items.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calculator size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Comece adicionando itens para calcular o valor do serviço.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-end group">
                      <div className="col-span-12 md:col-span-6 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Descrição do Item #{index + 1}</label>
                        <input 
                          type="text"
                          placeholder="Mão de obra, Material, Frete..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 font-medium"
                          value={item.description}
                          onChange={e => updateItem(item.id, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Qtd</label>
                        <input 
                          type="number"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 font-medium"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-5 md:col-span-3 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Unitário (R$)</label>
                        <input 
                          type="number"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-900"
                          value={item.unitPrice}
                          onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-3 md:col-span-1 pb-1 flex justify-end">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <h3 className="font-bold text-lg mb-6 flex items-center">
              <Calculator size={20} className="mr-2 text-blue-400" /> Resumo de Valores
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-slate-400 text-sm">
                <span>Subtotal</span>
                <span className="text-white font-medium">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-sm">
                  <div className="flex items-center">
                    <Percent size={14} className="mr-1" /> Taxas (%)
                  </div>
                  <input 
                    type="number"
                    className="w-20 bg-slate-800 border-none rounded-md px-2 py-1 text-right text-white focus:ring-1 focus:ring-blue-500"
                    value={tax}
                    onChange={e => setTax(Number(e.target.value))}
                  />
                </div>
                <div className="flex justify-between items-center text-slate-400 text-sm">
                  <span>Desconto (R$)</span>
                  <input 
                    type="number"
                    className="w-20 bg-slate-800 border-none rounded-md px-2 py-1 text-right text-white focus:ring-1 focus:ring-blue-500"
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 mt-6">
                <p className="text-blue-400 text-[10px] uppercase font-black tracking-widest mb-1">Total Estimado</p>
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-500 text-xl">R$</span>
                  <span className="text-4xl font-black">{total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleGeneratePDF}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-900/40 group"
            >
              <span>Finalizar Orçamento</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start space-x-3">
            <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Dica: Adicione margem de erro para imprevistos em montagens industriais. Recomenda-se entre 10% e 15% sobre o custo de material.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
