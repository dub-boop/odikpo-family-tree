import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { FamilyTreeNode } from '@shared/schema';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FileDownIcon, Image, File, Settings } from 'lucide-react';

interface ExportTreeDialogProps {
  treeData: FamilyTreeNode | null;
  treeRef: React.RefObject<HTMLDivElement>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportTreeDialog({ 
  treeData, 
  treeRef,
  open,
  onOpenChange
}: ExportTreeDialogProps) {
  const [format, setFormat] = useState<'png' | 'pdf'>('png');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter' | 'legal'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [quality, setQuality] = useState<number>(90);
  const [filename, setFilename] = useState<string>('odikpo-family-tree');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  const paperSizes = {
    a4: { width: 210, height: 297 }, // mm
    letter: { width: 215.9, height: 279.4 }, // mm
    legal: { width: 215.9, height: 355.6 }, // mm
  };
  
  const handleExport = async () => {
    if (!treeRef.current || !treeData) {
      toast({
        title: "Export failed",
        description: "Could not find tree element to export",
        variant: "destructive"
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      const scale = 2; // Higher scale for better quality
      const options = {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        height: treeRef.current.scrollHeight,
        width: treeRef.current.scrollWidth,
      };
      
      const canvas = await html2canvas(treeRef.current, options);
      
      if (format === 'png') {
        // Export as PNG
        const dataUrl = canvas.toDataURL(`image/png`, quality / 100);
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        // Export as PDF
        const imgData = canvas.toDataURL(`image/jpeg`, quality / 100);
        const dims = paperSizes[paperSize];
        
        const pdf = new jsPDF({
          orientation: orientation,
          unit: 'mm',
          format: paperSize,
        });
        
        // Calculate the dimensions to fit the tree within the page
        const imgWidth = orientation === 'landscape' ? dims.height : dims.width;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const margin = 10; // margin in mm
        pdf.addImage(
          imgData, 
          'JPEG', 
          margin, 
          margin, 
          imgWidth - (margin * 2), 
          imgHeight > (dims.width - margin * 2) ? (dims.width - margin * 2) : imgHeight
        );
        
        // Add metadata - title at the top and generation count
        pdf.setFontSize(10);
        pdf.text(
          `Odikpo Family Tree - Generated on ${new Date().toLocaleDateString()}`,
          margin,
          dims.height - 5
        );
        
        pdf.save(`${filename}.pdf`);
      }
      
      toast({
        title: "Export successful",
        description: `Family tree exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "An error occurred during export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Family Tree</DialogTitle>
          <DialogDescription>
            Export your family tree as an image or PDF document.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="format" className="flex items-center gap-2">
              <FileDownIcon className="h-4 w-4" />
              Format
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="format" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="export-format">Export Format</Label>
                <RadioGroup
                  id="export-format"
                  value={format}
                  onValueChange={(value) => setFormat(value as 'png' | 'pdf')}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="png" id="png" />
                    <Label htmlFor="png" className="cursor-pointer">PNG Image</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="cursor-pointer">PDF Document</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {format === 'pdf' && (
                <>
                  <div>
                    <Label htmlFor="paper-size">Paper Size</Label>
                    <RadioGroup
                      id="paper-size"
                      value={paperSize}
                      onValueChange={(value) => setPaperSize(value as 'a4' | 'letter' | 'legal')}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="a4" id="a4" />
                        <Label htmlFor="a4" className="cursor-pointer">A4</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="letter" id="letter" />
                        <Label htmlFor="letter" className="cursor-pointer">Letter</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="legal" id="legal" />
                        <Label htmlFor="legal" className="cursor-pointer">Legal</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor="orientation">Orientation</Label>
                    <RadioGroup
                      id="orientation"
                      value={orientation}
                      onValueChange={(value) => setOrientation(value as 'portrait' | 'landscape')}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="portrait" id="portrait" />
                        <Label htmlFor="portrait" className="cursor-pointer">Portrait</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="landscape" id="landscape" />
                        <Label htmlFor="landscape" className="cursor-pointer">Landscape</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="filename">Filename</Label>
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Enter filename"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="quality">Quality ({quality}%)</Label>
                </div>
                <Slider
                  id="quality"
                  min={20}
                  max={100}
                  step={5}
                  value={[quality]}
                  onValueChange={(vals) => setQuality(vals[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Lower (Smaller File)</span>
                  <span>Higher (Larger File)</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="min-h-[200px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <File className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Preview not available. The tree will be exported as shown in the viewer.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? 'Exporting...' : 'Export'}
            <FileDownIcon className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}