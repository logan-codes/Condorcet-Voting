import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Download, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGeneratorProps {
  votingLink: string;
  electionTitle: string;
}

const QRCodeGenerator = ({ votingLink, electionTitle }: QRCodeGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { toast } = useToast();

  const generateQRCode = () => {
    // Using a free QR code API service
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(votingLink)}`;
    setQrCodeUrl(qrApiUrl);
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${electionTitle.replace(/\s+/g, '_')}_voting_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "QR code has been saved to your device.",
    });
  };

  const copyVotingLink = () => {
    navigator.clipboard.writeText(votingLink);
    toast({
      title: "Link Copied!",
      description: "Voting link has been copied to your clipboard.",
    });
  };

  const shareVotingLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vote in ${electionTitle}`,
          text: `Please vote in the election: ${electionTitle}`,
          url: votingLink,
        });
        toast({
          title: "Shared Successfully",
          description: "Voting link has been shared.",
        });
      } catch (error) {
        copyVotingLink();
      }
    } else {
      copyVotingLink();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code Generator
        </CardTitle>
        <CardDescription>
          Generate QR code for easy sharing of voting links
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="votingLink" className="text-sm font-medium">Voting Link</Label>
          <Input
            id="votingLink"
            value={votingLink}
            readOnly
            className="mt-1 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={generateQRCode}
            className="flex-1"
            variant="outline"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Generate QR
          </Button>
        </div>

        {qrCodeUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={qrCodeUrl} 
                alt="Voting QR Code" 
                className="border rounded-lg"
                width={200}
                height={200}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={downloadQRCode}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                onClick={copyVotingLink}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button 
                onClick={shareVotingLink}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator; 