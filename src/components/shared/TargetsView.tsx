import React from 'react';
import { TARGETS } from '../../config';
import { formatTargetValue } from '../../lib/utils';

export default function TargetsView() {
  return (
    <div className="targets-layout">
      {(() => {
        const sections: React.ReactNode[] = [];
        let currentItems: React.ReactNode[] = [];
        let currentTitle = '';
        let sectionIndex = 0;

        function flush() {
          if (currentTitle) {
            sections.push(
              <section className="targets-section" key={`section-${sectionIndex++}`}>
                <div className="targets-section-header">
                  <h3>{currentTitle}</h3>
                </div>
                <div className="targets-list">{currentItems}</div>
              </section>
            );
          }
          currentItems = [];
        }

        TARGETS.forEach((item, i) => {
          if ('section' in item) {
            flush();
            currentTitle = item.section;
            return;
          }
          currentItems.push(
            <div className={`target-item${item.big ? ' big' : ''}`} key={i}>
              <div className="target-label">{item.label}</div>
              <div className={`target-value ${item.type === 'money' ? 'money' : ''} ${item.big ? 'big' : ''}`}>
                {formatTargetValue(item)}
              </div>
            </div>
          );
        });
        flush();

        return sections;
      })()}
    </div>
  );
}
