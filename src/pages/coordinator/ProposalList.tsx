
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/formatters';

const ProposalList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { proposals, loading } = useProposals();
  
  console.log("All proposals:", proposals); // Log to check NIM data

  const filteredProposals = proposals.filter(proposal => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        proposal.title.toLowerCase().includes(query) ||
        (proposal.studentName && proposal.studentName.toLowerCase().includes(query)) ||
        (proposal.student?.nim && proposal.student.nim.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleViewProposal = (proposalId: string) => {
    navigate(`/coordinator/proposal-detail/${proposalId}`, { state: { from: '/coordinator/proposal-list' } });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daftar Proposal KP</h1>
        <div className="relative w-64">
          <Input
            placeholder="Cari proposal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Proposal yang Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">NIM</TableHead>
                    <TableHead className="text-center">Nama</TableHead>
                    <TableHead className="text-center">Judul Proposal</TableHead>
                    <TableHead className="text-center">Tanggal Upload</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.length > 0 ? (
                    filteredProposals.map((proposal) => (
                      <TableRow 
                        key={proposal.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewProposal(proposal.id)}
                      >
                        <TableCell className="text-center">{proposal.student?.nim || "-"}</TableCell>
                        <TableCell className="text-center">{proposal.studentName || "-"}</TableCell>
                        <TableCell className="text-center">{proposal.title}</TableCell>
                        <TableCell className="text-center">{formatDate(proposal.submissionDate)}</TableCell>
                        <TableCell className="text-center">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium
                              ${proposal.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                proposal.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}
                          >
                            {proposal.status === 'approved' ? 'Disetujui' : 
                             proposal.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        {searchQuery ? 'Tidak ada proposal yang sesuai dengan pencarian' : 'Belum ada proposal yang masuk'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalList;
