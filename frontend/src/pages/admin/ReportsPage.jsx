import React from 'react';
import { Shield, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports Management</h1>
          <p className="text-muted-foreground">Manage anonymous reports and investigations</p>
        </div>
        <Button leftIcon={Plus}>
          New Report
        </Button>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Reports Management Coming Soon</h3>
            <p className="text-muted-foreground">
              This feature is currently under development and will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;